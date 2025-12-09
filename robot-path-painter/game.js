/**
 * Robot Path Painter - Bundled Game File
 * This file combines all modular classes for direct browser use (no server needed)
 * Individual modules are in /js folder for development
 */

// ===== Robot Class =====
class Robot {
    constructor(startPosition) {
        this.startPosition = { ...startPosition };
        this.position = { ...startPosition };
    }

    move(direction) {
        const deltas = {
            'up': { x: 0, y: -1 },
            'down': { x: 0, y: 1 },
            'left': { x: -1, y: 0 },
            'right': { x: 1, y: 0 }
        };
        const delta = deltas[direction];
        if (delta) {
            this.position.x += delta.x;
            this.position.y += delta.y;
        }
        return { ...this.position };
    }

    isOutOfBounds(gridSize) {
        return (
            this.position.x < 0 ||
            this.position.x >= gridSize ||
            this.position.y < 0 ||
            this.position.y >= gridSize
        );
    }

    getPositionKey() {
        return `${this.position.x},${this.position.y}`;
    }

    reset() {
        this.position = { ...this.startPosition };
    }

    setStartPosition(newStart) {
        this.startPosition = { ...newStart };
        this.position = { ...newStart };
    }
}

// ===== Grid Class =====
class Grid {
    constructor(size, targetCells = [], obstacles = []) {
        this.size = size;
        this.targetCells = new Set(targetCells);
        this.paintedCells = new Set();
        this.obstacles = new Set(obstacles);
    }

    paintCell(positionKey) {
        this.paintedCells.add(positionKey);
    }

    isPainted(positionKey) {
        return this.paintedCells.has(positionKey);
    }

    isTarget(positionKey) {
        return this.targetCells.has(positionKey);
    }

    hasObstacle(positionKey) {
        return this.obstacles.has(positionKey);
    }

    removeObstacle(positionKey) {
        return this.obstacles.delete(positionKey);
    }

    resetObstacles(obstacles = []) {
        this.obstacles = new Set(obstacles);
    }

    allTargetsPainted() {
        for (const target of this.targetCells) {
            if (!this.paintedCells.has(target)) {
                return false;
            }
        }
        return true;
    }

    clearPaint() {
        this.paintedCells.clear();
    }

    configure(size, targets, obstacles = []) {
        this.size = size;
        this.targetCells = new Set(targets);
        this.paintedCells.clear();
        this.obstacles = new Set(obstacles);
    }

    render(container, robotPosition) {
        // Preserve overlays (robot, projectile)
        const robotOverlay = document.getElementById('robotOverlay');
        const projectileOverlay = document.getElementById('activeProjectile');
        
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;

                const key = `${x},${y}`;

                if (this.isTarget(key)) {
                    cell.classList.add('target');
                }
                if (this.isPainted(key)) {
                    cell.classList.add('painted');
                }
                if (this.hasObstacle(key)) {
                    cell.classList.add('obstacle');
                    const obstacle = document.createElement('span');
                    obstacle.className = 'obstacle-emoji';
                    obstacle.textContent = '🪨';
                    cell.appendChild(obstacle);
                }

                container.appendChild(cell);
            }
        }
        
        // Re-add overlays
        if (robotOverlay) container.appendChild(robotOverlay);
        if (projectileOverlay) container.appendChild(projectileOverlay);
    }

    // Get cell position for smooth animations
    getCellPosition(container, x, y) {
        const cell = container.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        if (!cell) return null;
        const containerRect = container.getBoundingClientRect();
        const cellRect = cell.getBoundingClientRect();
        return {
            left: cellRect.left - containerRect.left + cellRect.width / 2,
            top: cellRect.top - containerRect.top + cellRect.height / 2,
            width: cellRect.width,
            height: cellRect.height
        };
    }
}

// ===== Levels Data =====
const LEVELS = [
    // Level 1: Simple horizontal line (intro - no obstacles)
    { gridSize: 5, start: { x: 0, y: 2 }, targets: ['1,2', '2,2'] },
    // Level 2: L-shape (learning turns - no obstacles)
    { gridSize: 5, start: { x: 0, y: 0 }, targets: ['1,0', '2,0', '2,1', '2,2'] },
    // Level 3: Intro to obstacles - rock visible but doesn't block path
    { gridSize: 5, start: { x: 0, y: 2 }, targets: ['1,2', '2,2', '3,2'], obstacles: ['2,1'] },
    // Level 4: Navigate around obstacles
    { gridSize: 5, start: { x: 0, y: 2 }, targets: ['1,2', '1,1', '2,1', '2,2', '3,2'], obstacles: ['0,1', '3,1'] },
    // Level 5: More obstacles to navigate around
    { gridSize: 5, start: { x: 1, y: 1 }, targets: ['2,1', '3,1', '3,2', '3,3', '2,3', '1,3', '1,2'], obstacles: ['2,2', '0,2'] },
    // Level 6: First REQUIRED shooting - obstacle blocks the only path
    { gridSize: 5, start: { x: 0, y: 2 }, targets: ['1,2', '2,2', '3,2', '4,2'], obstacles: ['2,2'] },
    // Level 7: Larger grid perimeter
    { gridSize: 6, start: { x: 0, y: 0 }, targets: ['1,0', '2,0', '3,0', '4,0', '4,1', '4,2', '4,3', '4,4', '3,4', '2,4', '1,4', '0,4', '0,3', '0,2', '0,1'] },
    // Level 8: Diagonal staircase
    { gridSize: 6, start: { x: 0, y: 5 }, targets: ['0,4', '1,4', '1,3', '2,3', '2,2', '3,2', '3,1', '4,1', '4,0', '5,0'] },
    // Level 9: Cross pattern - shoot obstacle in center
    { gridSize: 7, start: { x: 3, y: 0 }, targets: ['3,1', '3,2', '3,3', '3,4', '3,5', '3,6', '0,3', '1,3', '2,3', '4,3', '5,3', '6,3'], obstacles: ['3,3'] },
    // Level 10: Large perimeter
    { gridSize: 7, start: { x: 0, y: 0 }, targets: ['1,0', '2,0', '3,0', '4,0', '5,0', '6,0', '6,1', '6,2', '6,3', '6,4', '6,5', '6,6', '5,6', '4,6', '3,6', '2,6', '1,6', '0,6', '0,5', '0,4', '0,3', '0,2', '0,1'] },
    // Level 11: Shoot multiple obstacles
    { gridSize: 6, start: { x: 0, y: 2 }, targets: ['1,2', '2,2', '3,2', '4,2', '5,2'], obstacles: ['2,2', '4,2'] },
    // Level 12: Complex path with obstacles
    { gridSize: 6, start: { x: 0, y: 0 }, targets: ['1,0', '2,0', '3,0', '3,1', '3,2', '3,3', '3,4', '3,5'], obstacles: ['3,2', '2,3'] }
];

function getLevel(levelNum) {
    const index = Math.min(levelNum - 1, LEVELS.length - 1);
    const level = LEVELS[Math.max(0, index)];
    return { 
        ...level,
        obstacles: level.obstacles ? [...level.obstacles] : []
    };
}

function getTotalLevels() {
    return LEVELS.length;
}

// ===== Sequence Class =====
class Sequence {
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

// ===== Audio Class =====
class Audio {
    constructor() {
        this.enabled = true;
        this.context = null;
    }

    init() {
        if (!this.context) {
            try {
                this.context = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                this.enabled = false;
            }
        }
    }

    play(type) {
        if (!this.enabled) return;
        this.init();
        if (!this.context) return;

        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);

            const sounds = {
                'click': { freq: 600, duration: 0.1, type: 'sine' },
                'move': { freq: 400, duration: 0.15, type: 'sine' },
                'paint': { freq: 800, duration: 0.1, type: 'sine' },
                'success': { freq: 523, duration: 0.3, type: 'sine' },
                'error': { freq: 200, duration: 0.3, type: 'sawtooth' },
                'clear': { freq: 300, duration: 0.2, type: 'triangle' },
                'save': { freq: 700, duration: 0.2, type: 'sine' },
                'incomplete': { freq: 350, duration: 0.4, type: 'sine' },
                'fire': { freq: 150, duration: 0.2, type: 'sawtooth' },
                'explosion': { freq: 80, duration: 0.4, type: 'square' }
            };

            const sound = sounds[type] || sounds.click;
            oscillator.frequency.value = sound.freq;
            oscillator.type = sound.type;
            gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + sound.duration);
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + sound.duration);
        } catch (e) {}
    }

    playSuccessMelody() {
        if (!this.enabled) return;
        this.init();
        if (!this.context) return;
        [523, 659, 784].forEach((freq, i) => {
            setTimeout(() => this.playNote(freq, 0.2), i * 150);
        });
    }

    playNote(freq, duration) {
        if (!this.context) return;
        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + duration);
        } catch (e) {}
    }
}

// ===== DragDrop Class =====
class DragDrop {
    constructor(options) {
        this.sequenceArea = options.sequenceArea;
        this.trashZone = options.trashZone;
        this.onAddCommand = options.onAddCommand;
        this.onAddFireCommand = options.onAddFireCommand;
        this.onReorder = options.onReorder;
        this.onRemove = options.onRemove;
        
        this.dragState = null;
        this.dragElement = null;
        this.placeholder = null;
        this.dragThreshold = 15;
        this.longPressTime = 200;
        
        this.setupPaletteButtons();
        this.setupSequenceArea();
        this.setupTrashZone();
    }

    setupPaletteButtons() {
        document.querySelectorAll('.command-btn').forEach(btn => {
            this.addTouchDragOrTap(btn, 
                () => ({ type: 'add', commandType: 'move', direction: btn.dataset.command }),
                () => this.onAddCommand(btn.dataset.command)
            );
        });

        document.querySelectorAll('.fire-btn').forEach(btn => {
            this.addTouchDragOrTap(btn,
                () => ({ type: 'add', commandType: 'fire', direction: btn.dataset.fire }),
                () => this.onAddFireCommand(btn.dataset.fire)
            );
        });
    }

    setupSequenceArea() {
        document.addEventListener('touchmove', (e) => {
            if (!this.dragState) return;
            e.preventDefault();
            this.handleDragMove(e.touches[0]);
        }, { passive: false });

        document.addEventListener('touchend', () => {
            if (!this.dragState) return;
            this.handleDrop();
        });

        document.addEventListener('touchcancel', () => {
            this.cancelDrag();
        });
    }

    setupTrashZone() {
        if (!this.trashZone) return;
        this.trashZone.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    addTouchDragOrTap(element, getDataFn, onTap) {
        let touchStartPos = null;
        let touchStartTime = null;
        let isDragging = false;

        element.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            touchStartPos = { x: touch.clientX, y: touch.clientY };
            touchStartTime = Date.now();
            isDragging = false;
        }, { passive: true });

        element.addEventListener('touchmove', (e) => {
            if (!touchStartPos) return;
            
            const touch = e.touches[0];
            const dx = Math.abs(touch.clientX - touchStartPos.x);
            const dy = Math.abs(touch.clientY - touchStartPos.y);
            
            if (!isDragging && (dx > this.dragThreshold || dy > this.dragThreshold)) {
                isDragging = true;
                e.preventDefault();
                this.startDrag(touch, element, getDataFn());
            }
            
            if (isDragging && this.dragState) {
                e.preventDefault();
                this.handleDragMove(touch);
            }
        }, { passive: false });

        element.addEventListener('touchend', () => {
            const touchDuration = Date.now() - touchStartTime;
            
            if (isDragging && this.dragState) {
                this.handleDrop();
            } else if (touchStartPos && touchDuration < 300) {
                onTap();
            }
            
            touchStartPos = null;
            touchStartTime = null;
            isDragging = false;
        });

        element.addEventListener('touchcancel', () => {
            touchStartPos = null;
            touchStartTime = null;
            isDragging = false;
            this.cancelDrag();
        });
    }

    makeItemsDraggable(items) {
        items.forEach((item) => {
            const index = parseInt(item.dataset.index);
            if (isNaN(index)) return;
            
            let touchStartPos = null;
            let isDragging = false;

            item.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                touchStartPos = { x: touch.clientX, y: touch.clientY };
                isDragging = false;
            }, { passive: true });

            item.addEventListener('touchmove', (e) => {
                if (!touchStartPos) return;
                
                const touch = e.touches[0];
                const dx = Math.abs(touch.clientX - touchStartPos.x);
                const dy = Math.abs(touch.clientY - touchStartPos.y);
                
                if (!isDragging && (dx > this.dragThreshold || dy > this.dragThreshold)) {
                    isDragging = true;
                    e.preventDefault();
                    this.startDrag(touch, item, {
                        type: 'reorder',
                        index: index,
                        element: item
                    });
                    item.classList.add('dragging');
                }
                
                if (isDragging && this.dragState) {
                    e.preventDefault();
                    this.handleDragMove(touch);
                }
            }, { passive: false });

            item.addEventListener('touchend', () => {
                if (isDragging && this.dragState) {
                    this.handleDrop();
                }
                touchStartPos = null;
                isDragging = false;
            });

            item.addEventListener('touchcancel', () => {
                touchStartPos = null;
                isDragging = false;
                this.cancelDrag();
            });
        });
    }

    startDrag(touch, sourceElement, data) {
        this.dragState = {
            data: data,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY
        };

        this.dragElement = document.createElement('div');
        this.dragElement.className = 'drag-ghost';
        this.dragElement.innerHTML = sourceElement.innerHTML;
        this.dragElement.style.cssText = `
            position: fixed;
            left: ${touch.clientX - 30}px;
            top: ${touch.clientY - 30}px;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            background: var(--primary-color);
            border-radius: var(--radius-md);
            pointer-events: none;
            z-index: 1000;
            opacity: 0.9;
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
            transform: scale(1.1);
        `;
        document.body.appendChild(this.dragElement);

        this.sequenceArea.classList.add('drag-active');
        if (this.trashZone) {
            this.trashZone.classList.add('drag-active');
        }

        if (data.type === 'reorder') {
            this.createPlaceholder();
            data.element.style.opacity = '0.3';
        }
    }

    handleDragMove(touch) {
        if (!this.dragState || !this.dragElement) return;

        this.dragState.currentX = touch.clientX;
        this.dragState.currentY = touch.clientY;

        this.dragElement.style.left = `${touch.clientX - 30}px`;
        this.dragElement.style.top = `${touch.clientY - 30}px`;

        if (this.trashZone && this.isOverElement(touch, this.trashZone)) {
            this.trashZone.classList.add('drag-over');
            this.sequenceArea.classList.remove('drag-over');
        } else if (this.isOverElement(touch, this.sequenceArea)) {
            this.sequenceArea.classList.add('drag-over');
            if (this.trashZone) {
                this.trashZone.classList.remove('drag-over');
            }
            
            if (this.dragState.data.type === 'reorder' || this.dragState.data.type === 'add') {
                this.updatePlaceholderPosition(touch);
            }
        } else {
            this.sequenceArea.classList.remove('drag-over');
            if (this.trashZone) {
                this.trashZone.classList.remove('drag-over');
            }
        }
    }

    handleDrop() {
        if (!this.dragState) return;

        const touch = {
            clientX: this.dragState.currentX,
            clientY: this.dragState.currentY
        };

        if (this.trashZone && this.isOverElement(touch, this.trashZone)) {
            if (this.dragState.data.type === 'reorder') {
                this.onRemove(this.dragState.data.index);
            }
        } else if (this.isOverElement(touch, this.sequenceArea)) {
            const data = this.dragState.data;
            
            if (data.type === 'add') {
                const dropIndex = this.getDropIndex(touch);
                if (data.commandType === 'fire') {
                    this.onAddFireCommand(data.direction, dropIndex);
                } else {
                    this.onAddCommand(data.direction, dropIndex);
                }
            } else if (data.type === 'reorder') {
                const dropIndex = this.getDropIndex(touch);
                if (dropIndex !== data.index && dropIndex !== data.index + 1) {
                    this.onReorder(data.index, dropIndex);
                }
            }
        }

        this.cleanupDrag();
    }

    cancelDrag() {
        this.cleanupDrag();
    }

    cleanupDrag() {
        if (this.dragElement) {
            this.dragElement.remove();
            this.dragElement = null;
        }

        if (this.placeholder) {
            this.placeholder.remove();
            this.placeholder = null;
        }

        if (this.dragState?.data?.element) {
            this.dragState.data.element.style.opacity = '';
            this.dragState.data.element.classList.remove('dragging');
        }

        this.sequenceArea.classList.remove('drag-active', 'drag-over');
        if (this.trashZone) {
            this.trashZone.classList.remove('drag-active', 'drag-over');
        }

        this.dragState = null;
    }

    isOverElement(touch, element) {
        const rect = element.getBoundingClientRect();
        return (
            touch.clientX >= rect.left &&
            touch.clientX <= rect.right &&
            touch.clientY >= rect.top &&
            touch.clientY <= rect.bottom
        );
    }

    getDropIndex(touch) {
        const items = this.sequenceArea.querySelectorAll('.sequence-item:not(.drag-ghost), .loop-block');
        let dropIndex = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (this.dragState?.data?.element === item) continue;
            
            const rect = item.getBoundingClientRect();
            const midX = rect.left + rect.width / 2;
            
            if (touch.clientX > midX) {
                dropIndex = parseInt(item.dataset.index) + 1;
            } else {
                break;
            }
        }

        return dropIndex;
    }

    createPlaceholder() {
        this.placeholder = document.createElement('div');
        this.placeholder.className = 'drop-placeholder';
    }

    updatePlaceholderPosition(touch) {
        if (!this.placeholder) {
            this.createPlaceholder();
        }

        const items = this.sequenceArea.querySelectorAll('.sequence-item:not(.dragging), .loop-block:not(.dragging)');
        let insertBefore = null;

        for (const item of items) {
            if (this.dragState?.data?.element === item) continue;
            
            const rect = item.getBoundingClientRect();
            const midX = rect.left + rect.width / 2;
            
            if (touch.clientX < midX) {
                insertBefore = item;
                break;
            }
        }

        if (insertBefore) {
            this.sequenceArea.insertBefore(this.placeholder, insertBefore);
        } else {
            this.sequenceArea.appendChild(this.placeholder);
        }
    }
}

// ===== Game Class =====
class Game {
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
        this.elements.levelNum.textContent = levelNum;
        this.render();
        this.updateRobotOverlay(false);
    }

    render() {
        this.grid.render(this.elements.gridContainer, this.robot.position);
        this.renderSequence();
        this.renderSavedFunctions();
    }

    // Create or update robot overlay for smooth movement
    updateRobotOverlay(animate = true) {
        let robotOverlay = document.getElementById('robotOverlay');
        
        if (!robotOverlay) {
            robotOverlay = document.createElement('div');
            robotOverlay.id = 'robotOverlay';
            robotOverlay.className = 'robot-overlay idle';
            robotOverlay.textContent = '🤖';
            this.elements.gridContainer.appendChild(robotOverlay);
        }

        // Need to wait for grid to render before getting positions
        requestAnimationFrame(() => {
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
                
                if (!animate) {
                    // Force reflow then restore transition
                    robotOverlay.offsetHeight;
                    robotOverlay.style.transition = '';
                }
            }
        });
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
        
        // Make sequence items draggable for touch reordering
        const sequenceItems = this.elements.sequenceArea.querySelectorAll('.sequence-item, .loop-block');
        this.dragDrop.makeItemsDraggable(sequenceItems);
    }

    createLoopBlock(cmd, index, isActive) {
        const loopBlock = document.createElement('div');
        loopBlock.className = 'loop-block' + (isActive ? ' active' : '');
        loopBlock.dataset.index = index;

        // Loop header with iteration controls
        const header = document.createElement('div');
        header.className = 'loop-header';
        
        const loopIcon = document.createElement('span');
        loopIcon.className = 'loop-icon';
        loopIcon.textContent = '🔄';
        header.appendChild(loopIcon);

        // Iteration controls
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

        // Loop body - container for commands
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

        // Click on loop block to select/deselect
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

    addCommand(direction) {
        if (this.isPlaying) return;
        this.sequence.addCommand(direction);
        this.renderSequence();
        this.audio.play('click');
    }

    addCommandAt(direction, index) {
        if (this.isPlaying) return;
        
        const cmd = { type: 'move', direction };
        if (this.sequence.activeLoopIndex !== null) {
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

            // Check if next position has an obstacle
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
                // Animate to out of bounds position then show error
                this.updateRobotOverlay(true);
                await this.delay(250);
                this.audio.play('error');
                this.showFeedback('💥');
                await this.delay(500);
                this.resetLevel();
                return;
            }

            // Smooth movement animation
            this.updateRobotOverlay(true);
            this.audio.play('move');
            await this.delay(250);

            this.grid.paintCell(this.robot.getPositionKey());
            this.grid.render(this.elements.gridContainer, this.robot.position);
            this.updateRobotOverlay(false); // Reposition without animation after paint
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

    animateRobotMove() {
        const robotEmoji = document.querySelector('.robot-emoji');
        if (robotEmoji) {
            robotEmoji.classList.add('moving');
            setTimeout(() => robotEmoji.classList.remove('moving'), 300);
        }
    }

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
        
        // Create projectile at robot position
        await this.createProjectile(projectilePos.x, projectilePos.y, direction);
        
        while (true) {
            projectilePos.x += delta.x;
            projectilePos.y += delta.y;
            
            const posKey = `${projectilePos.x},${projectilePos.y}`;
            
            if (projectilePos.x < 0 || projectilePos.x >= this.grid.size ||
                projectilePos.y < 0 || projectilePos.y >= this.grid.size) {
                // Animate to edge then explode
                await this.moveProjectileTo(projectilePos.x - delta.x, projectilePos.y - delta.y);
                await this.showExplosion(projectilePos.x - delta.x, projectilePos.y - delta.y);
                break;
            }
            
            // Smooth movement to next cell
            await this.moveProjectileTo(projectilePos.x, projectilePos.y);
            await this.delay(80);
            
            if (this.grid.hasObstacle(posKey)) {
                this.grid.removeObstacle(posKey);
                await this.showExplosion(projectilePos.x, projectilePos.y);
                this.audio.play('explosion');
                this.grid.render(this.elements.gridContainer, this.robot.position);
                this.updateRobotOverlay(false); // Reposition after obstacle removal
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
        
        // Position at starting cell
        const pos = this.grid.getCellPosition(this.elements.gridContainer, x, y);
        if (pos) {
            projectile.style.transition = 'none';
            projectile.style.left = `${pos.left}px`;
            projectile.style.top = `${pos.top}px`;
            projectile.style.width = `${pos.width}px`;
            projectile.style.height = `${pos.height}px`;
            projectile.style.marginLeft = `-${pos.width / 2}px`;
            projectile.style.marginTop = `-${pos.height / 2}px`;
            projectile.offsetHeight; // Force reflow
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

    async showProjectile(x, y, direction) {
        // Legacy method - now using createProjectile and moveProjectileTo
        this.clearProjectile();
        
        const cell = this.elements.gridContainer.querySelector(
            `[data-x="${x}"][data-y="${y}"]`
        );
        
        if (cell) {
            const projectile = document.createElement('span');
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
            cell.appendChild(projectile);
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

    setupEventListeners() {
        document.querySelectorAll('.command-btn').forEach(btn => {
            btn.addEventListener('click', () => this.addCommand(btn.dataset.command));
            btn.addEventListener('dragstart', (e) => { e.dataTransfer.setData('command', btn.dataset.command); btn.classList.add('dragging'); });
            btn.addEventListener('dragend', () => btn.classList.remove('dragging'));
            // Note: Touch drag is handled by DragDrop class
        });

        document.querySelectorAll('.fire-btn').forEach(btn => {
            btn.addEventListener('click', () => this.addFireCommand(btn.dataset.fire));
            // Note: Touch drag is handled by DragDrop class
        });

        this.elements.sequenceArea.addEventListener('dragover', (e) => { e.preventDefault(); this.elements.sequenceArea.classList.add('drag-over'); });
        this.elements.sequenceArea.addEventListener('dragleave', () => this.elements.sequenceArea.classList.remove('drag-over'));
        this.elements.sequenceArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.sequenceArea.classList.remove('drag-over');
            const command = e.dataTransfer.getData('command');
            if (command) this.addCommand(command);
        });
        this.elements.sequenceArea.addEventListener('click', (e) => {
            const item = e.target.closest('.sequence-item:not(.loop-item)');
            const loopBlock = e.target.closest('.loop-block');
            if (item && item.dataset.index !== undefined && !loopBlock) {
                this.removeCommand(parseInt(item.dataset.index));
            }
        });

        this.elements.playBtn.addEventListener('click', () => this.play());
        this.elements.resetBtn.addEventListener('click', () => this.resetLevel());
        this.elements.clearBtn.addEventListener('click', () => this.clearSequence());
        this.elements.saveBtn.addEventListener('click', () => this.saveFunction());
        this.elements.loopBtn.addEventListener('click', () => this.addLoop());

        this.elements.helpBtn.addEventListener('click', () => this.elements.helpOverlay.classList.add('active'));
        this.elements.closeHelpBtn.addEventListener('click', () => this.elements.helpOverlay.classList.remove('active'));
        this.elements.helpOverlay.addEventListener('click', (e) => { if (e.target === this.elements.helpOverlay) this.elements.helpOverlay.classList.remove('active'); });
        this.elements.nextBtn.addEventListener('click', () => this.nextLevel());

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
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
