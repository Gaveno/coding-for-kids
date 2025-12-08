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
    constructor(size, targetCells = []) {
        this.size = size;
        this.targetCells = new Set(targetCells);
        this.paintedCells = new Set();
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

    configure(size, targets) {
        this.size = size;
        this.targetCells = new Set(targets);
        this.paintedCells.clear();
    }

    render(container, robotPosition) {
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
                if (x === robotPosition.x && y === robotPosition.y) {
                    cell.classList.add('robot');
                    const robot = document.createElement('span');
                    robot.className = 'robot-emoji';
                    robot.textContent = '🤖';
                    cell.appendChild(robot);
                }

                container.appendChild(cell);
            }
        }
    }
}

// ===== Levels Data =====
const LEVELS = [
    { gridSize: 5, start: { x: 0, y: 2 }, targets: ['1,2', '2,2'] },
    { gridSize: 5, start: { x: 0, y: 0 }, targets: ['1,0', '2,0', '2,1', '2,2'] },
    { gridSize: 5, start: { x: 0, y: 2 }, targets: ['1,2', '1,1', '2,1', '2,2', '3,2'] },
    { gridSize: 5, start: { x: 1, y: 1 }, targets: ['2,1', '3,1', '3,2', '3,3', '2,3', '1,3', '1,2'] },
    { gridSize: 6, start: { x: 0, y: 0 }, targets: ['1,0', '2,0', '3,0', '4,0', '4,1', '4,2', '4,3', '4,4', '3,4', '2,4', '1,4', '0,4', '0,3', '0,2', '0,1'] },
    { gridSize: 6, start: { x: 0, y: 5 }, targets: ['0,4', '1,4', '1,3', '2,3', '2,2', '3,2', '3,1', '4,1', '4,0', '5,0'] },
    { gridSize: 7, start: { x: 3, y: 0 }, targets: ['3,1', '3,2', '3,3', '3,4', '3,5', '3,6', '0,3', '1,3', '2,3', '4,3', '5,3', '6,3'] },
    { gridSize: 7, start: { x: 0, y: 0 }, targets: ['1,0', '2,0', '3,0', '4,0', '5,0', '6,0', '6,1', '6,2', '6,3', '6,4', '6,5', '6,6', '5,6', '4,6', '3,6', '2,6', '1,6', '0,6', '0,5', '0,4', '0,3', '0,2', '0,1'] }
];

function getLevel(levelNum) {
    const index = Math.min(levelNum - 1, LEVELS.length - 1);
    return { ...LEVELS[Math.max(0, index)] };
}

function getTotalLevels() {
    return LEVELS.length;
}

// ===== Sequence Class =====
class Sequence {
    constructor() {
        this.commands = [];
        this.savedFunctions = [];
    }

    addCommand(direction) {
        this.commands.push({ type: 'move', direction });
    }

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

    removeAt(index) {
        this.commands.splice(index, 1);
    }

    clear() {
        this.commands = [];
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
        for (const cmd of this.commands) {
            if (cmd.type === 'function') {
                flat.push(...cmd.commands);
            } else {
                flat.push(cmd);
            }
        }
        return flat;
    }

    isEmpty() {
        return this.commands.length === 0;
    }

    static getDirectionEmoji(direction) {
        const emojis = { 'up': '⬆️', 'down': '⬇️', 'left': '⬅️', 'right': '➡️' };
        return emojis[direction] || '❓';
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
                'incomplete': { freq: 350, duration: 0.4, type: 'sine' }
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

// ===== Game Class =====
class Game {
    constructor() {
        this.currentLevel = 1;
        this.isPlaying = false;
        this.initializeComponents();
        this.initializeElements();
        this.setupFeedbackStyle();
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
    }

    loadLevel(levelNum) {
        const levelData = getLevel(levelNum);
        this.robot.setStartPosition(levelData.start);
        this.grid.configure(levelData.gridSize, levelData.targets);
        this.sequence.clear();
        this.elements.levelNum.textContent = levelNum;
        this.render();
    }

    render() {
        this.grid.render(this.elements.gridContainer, this.robot.position);
        this.renderSequence();
        this.renderSavedFunctions();
    }

    renderSequence() {
        const items = this.elements.sequenceArea.querySelectorAll('.sequence-item');
        items.forEach(item => item.remove());
        this.elements.sequencePlaceholder.style.display = this.sequence.isEmpty() ? 'block' : 'none';

        this.sequence.commands.forEach((cmd, index) => {
            const item = document.createElement('div');
            item.className = 'sequence-item';
            if (cmd.type === 'function') {
                item.classList.add('function-call');
                item.innerHTML = `📦${cmd.id}`;
            } else {
                item.textContent = Sequence.getDirectionEmoji(cmd.direction);
            }
            item.dataset.index = index;
            this.elements.sequenceArea.appendChild(item);
        });
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
        this.render();

        const flatSequence = this.sequence.flatten();

        for (let i = 0; i < flatSequence.length; i++) {
            const cmd = flatSequence[i];
            this.highlightCommand(i);
            
            this.robot.move(cmd.direction);
            this.grid.render(this.elements.gridContainer, this.robot.position);
            this.audio.play('move');
            this.animateRobotMove();

            if (this.robot.isOutOfBounds(this.grid.size)) {
                this.audio.play('error');
                this.showFeedback('💥');
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
            this.showFeedback('🤔');
        }

        this.isPlaying = false;
        this.elements.playBtn.disabled = false;
        this.clearHighlights();
    }

    highlightCommand(flatIndex) {
        this.clearHighlights();
        const items = this.elements.sequenceArea.querySelectorAll('.sequence-item');
        let count = 0;
        for (let i = 0; i < this.sequence.commands.length; i++) {
            const cmd = this.sequence.commands[i];
            if (cmd.type === 'function') {
                if (count + cmd.commands.length > flatIndex) { items[i]?.classList.add('executing'); return; }
                count += cmd.commands.length;
            } else {
                if (count === flatIndex) { items[i]?.classList.add('executing'); return; }
                count++;
            }
        }
    }

    clearHighlights() {
        this.elements.sequenceArea.querySelectorAll('.sequence-item').forEach(item => item.classList.remove('executing'));
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
        this.isPlaying = false;
        this.elements.playBtn.disabled = false;
        this.render();
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

    setupEventListeners() {
        document.querySelectorAll('.command-btn').forEach(btn => {
            btn.addEventListener('click', () => this.addCommand(btn.dataset.command));
            btn.addEventListener('dragstart', (e) => { e.dataTransfer.setData('command', btn.dataset.command); btn.classList.add('dragging'); });
            btn.addEventListener('dragend', () => btn.classList.remove('dragging'));
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.addCommand(btn.dataset.command); });
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
            const item = e.target.closest('.sequence-item');
            if (item && item.dataset.index !== undefined) this.removeCommand(parseInt(item.dataset.index));
        });

        this.elements.playBtn.addEventListener('click', () => this.play());
        this.elements.resetBtn.addEventListener('click', () => this.resetLevel());
        this.elements.clearBtn.addEventListener('click', () => this.clearSequence());
        this.elements.saveBtn.addEventListener('click', () => this.saveFunction());

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
