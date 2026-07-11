/**
 * Game Controller - Coordinates Ant, Grid, Sequence, Sprite, Runner, Audio
 */
import { Ant } from './Ant.js';
import { Grid } from './Grid.js';
import { Sequence } from './Sequence.js';
import { Audio } from './Audio.js';
import { AntSprite } from './AntSprite.js';
import { Runner } from './Runner.js';
import { createCommandBlock } from './Blocks.js';
import { getLevel, getTotalLevels } from './Levels.js';

export class Game {
    constructor() {
        this.currentLevel = 1;
        this.isPlaying = false;
        this.initializeElements();
        this.initializeComponents();
        this.setupEventListeners();
        this.setupResizeHandling();
        this.loadLevel(this.currentLevel);
    }

    initializeElements() {
        const ids = ['gridContainer', 'gridSection', 'sequenceArea', 'sequencePlaceholder',
            'leafTracker', 'playBtn', 'resetBtn', 'clearBtn', 'helpBtn', 'closeHelpBtn',
            'nextBtn', 'successOverlay', 'helpOverlay', 'levelNum'];
        this.elements = {};
        ids.forEach(id => { this.elements[id] = document.getElementById(id); });
    }

    initializeComponents() {
        const levelData = getLevel(1);
        this.ant = new Ant(levelData.start, levelData.heading);
        this.grid = new Grid(levelData.gridSize, levelData.nest, levelData.leaves, levelData.obstacles);
        this.sequence = new Sequence();
        this.audio = new Audio();
        this.sprite = new AntSprite(this.elements.gridContainer);
        this.runner = new Runner(this);
    }

    loadLevel(levelNum) {
        this.levelData = getLevel(levelNum);
        const { start, heading, gridSize, nest, leaves, obstacles } = this.levelData;
        this.ant.setStart(start, heading);
        this.grid.configure(gridSize, nest, leaves, obstacles);
        this.sequence.clear();
        this.elements.levelNum.textContent = levelNum;
        document.body.classList.toggle('has-leaves', leaves.length > 0);
        this.updateLeafTracker();
        this.renderGrid();
        this.renderSequence();
        requestAnimationFrame(() => requestAnimationFrame(() => this.syncSprite()));
    }

    renderGrid() {
        this.grid.render(this.elements.gridContainer);
        this.sprite.ensureAttached();
    }

    syncSprite() {
        this.sizeGrid();
        this.moveSpriteToAnt(false);
        this.sprite.setRotation(this.ant.rotationDeg, false);
    }

    sizeGrid() {
        const section = this.elements.gridSection;
        const size = Math.floor(Math.min(section.clientWidth, section.clientHeight));
        const container = this.elements.gridContainer;
        container.style.width = `${size}px`;
        container.style.height = `${size}px`;
        container.style.setProperty('--cell-size', `${size / this.grid.size}px`);
    }

    moveSpriteToAnt(animate = true) {
        const pos = this.grid.getCellPosition(
            this.elements.gridContainer, this.ant.position.x, this.ant.position.y);
        this.sprite.setPosition(pos, animate);
    }

    renderSequence() {
        this.elements.sequenceArea.querySelectorAll('.cmd-block').forEach(el => el.remove());
        this.elements.sequencePlaceholder.style.display = this.sequence.isEmpty() ? 'flex' : 'none';
        const handlers = {
            onCountChange: (i, d) => { if (!this.isPlaying && this.sequence.changeCount(i, d)) { this.renderSequence(); this.audio.play('click'); } },
            onRemove: (i) => { if (!this.isPlaying && this.sequence.removeAt(i)) { this.renderSequence(); this.audio.play('clear'); } }
        };
        this.sequence.commands.forEach((cmd, index) => {
            this.elements.sequenceArea.appendChild(createCommandBlock(cmd, index, handlers));
        });
    }

    highlightBlock(index) {
        this.elements.sequenceArea.querySelectorAll('.cmd-block').forEach((el, i) => {
            el.classList.toggle('executing', i === index);
        });
        const active = this.elements.sequenceArea.querySelector('.cmd-block.executing');
        if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }

    updateLeafTracker() {
        const tracker = this.elements.leafTracker;
        tracker.innerHTML = '';
        for (let i = 0; i < this.grid.totalLeaves; i++) {
            const leaf = document.createElement('img');
            leaf.src = '../art/leaf.png';
            leaf.alt = 'Leaf';
            leaf.className = 'tracker-leaf' + (i < this.grid.delivered ? ' delivered' : '');
            tracker.appendChild(leaf);
        }
    }

    addCommand(action) {
        if (this.isPlaying) return;
        this.sequence.add(action);
        this.renderSequence();
        this.audio.play('click');
    }

    async play() {
        if (this.isPlaying || this.sequence.isEmpty()) return;
        this.isPlaying = true;
        this.elements.playBtn.disabled = true;
        this.restoreLevelState();

        const { result } = await this.runner.run();

        if (result === 'success') {
            await this.runner.delay(300);
            this.elements.successOverlay.classList.add('active');
            this.audio.playSuccessMelody();
        } else if (result === 'crash') {
            this.restoreLevelState();
        } else {
            this.audio.play('incomplete');
            this.showFeedback('🤔');
        }

        this.isPlaying = false;
        this.elements.playBtn.disabled = false;
        this.highlightBlock(-1);
    }

    restoreLevelState() {
        this.ant.reset();
        this.grid.reset(this.levelData.leaves, this.levelData.obstacles);
        this.sprite.setCarrying(false);
        this.updateLeafTracker();
        this.renderGrid();
        this.moveSpriteToAnt(false);
        this.sprite.setRotation(this.ant.rotationDeg, false);
    }

    resetLevel() {
        if (this.isPlaying) return;
        this.restoreLevelState();
        this.highlightBlock(-1);
    }

    nextLevel() {
        if (this.currentLevel < getTotalLevels()) this.currentLevel++;
        this.loadLevel(this.currentLevel);
        this.elements.successOverlay.classList.remove('active');
    }

    showFeedback(emoji) {
        const feedback = document.createElement('div');
        feedback.className = 'floating-feedback';
        feedback.textContent = emoji;
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 800);
    }

    setupEventListeners() {
        document.querySelectorAll('.command-btn').forEach(btn => {
            btn.addEventListener('click', () => this.addCommand(btn.dataset.command));
        });
        this.elements.playBtn.addEventListener('click', () => this.play());
        this.elements.resetBtn.addEventListener('click', () => this.resetLevel());
        this.elements.clearBtn.addEventListener('click', () => {
            if (this.isPlaying) return;
            this.sequence.clear();
            this.renderSequence();
            this.audio.play('clear');
        });
        this.elements.nextBtn.addEventListener('click', () => this.nextLevel());
        this.elements.helpBtn.addEventListener('click', () => this.elements.helpOverlay.classList.add('active'));
        this.elements.closeHelpBtn.addEventListener('click', () => this.elements.helpOverlay.classList.remove('active'));
        this.elements.helpOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.helpOverlay) this.elements.helpOverlay.classList.remove('active');
        });
        document.addEventListener('keydown', (e) => {
            if (this.isPlaying) return;
            const keyMap = { ArrowUp: 'forward', ArrowRight: 'right', ArrowLeft: 'left' };
            if (keyMap[e.key]) this.addCommand(keyMap[e.key]);
            else if (e.key === 'Enter' || e.key === ' ') this.play();
            else if (e.key === 'Escape') this.resetLevel();
        });
    }

    setupResizeHandling() {
        const resync = () => { if (!this.isPlaying) requestAnimationFrame(() => this.syncSprite()); };
        window.addEventListener('resize', resync);
        window.addEventListener('orientationchange', () => setTimeout(resync, 100));
        if (typeof ResizeObserver !== 'undefined') {
            new ResizeObserver(resync).observe(this.elements.gridSection);
        }
    }
}
