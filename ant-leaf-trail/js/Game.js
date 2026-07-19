/**
 * Game Controller - Coordinates all modules; owns level/sandbox lifecycle
 */
import { Ant } from './Ant.js';
import { Grid } from './Grid.js';
import { Sequence } from './Sequence.js';
import { Audio } from './Audio.js';
import { AntSprite } from './AntSprite.js';
import { Runner } from './Runner.js';
import { Patrol } from './Patrol.js';
import { Progress } from './Progress.js';
import { Hud } from './Hud.js';
import { LevelMap } from './LevelMap.js';
import { Sandbox } from './Sandbox.js';
import { renderSequence } from './Blocks.js';
import { bindControls } from './Controls.js';
import { getLevel, getTotalLevels, starsFor } from './Levels.js';

export class Game {
    constructor() {
        this.currentLevel = 1;
        this.mode = 'campaign';
        this.isPlaying = false;
        this.patrol = null;
        this.patrolEl = null;
        this.initializeElements();
        this.initializeComponents();
        bindControls(this);
        this.loadLevel(this.currentLevel);
        this.sprite.startIdleLoop();
    }

    initializeElements() {
        const ids = ['gridContainer', 'gridSection', 'sequenceArea', 'sequencePlaceholder',
            'leafTracker', 'playBtn', 'resetBtn', 'clearBtn', 'helpBtn', 'closeHelpBtn',
            'nextBtn', 'successOverlay', 'helpOverlay', 'levelNum', 'successStars',
            'successCrumbs', 'successMapBtn', 'mapBtn', 'mapOverlay', 'mapNodes',
            'closeMapBtn', 'sandboxBar', 'dirBtn'];
        this.elements = {};
        ids.forEach(id => { this.elements[id] = document.getElementById(id); });
    }

    initializeComponents() {
        this.progress = new Progress();
        this.sandbox = new Sandbox(this.progress);
        this.hud = new Hud(this.elements);
        this.map = new LevelMap(this.elements, {
            onSelect: (level) => this.loadLevel(level),
            onSandbox: () => this.enterSandbox()
        });
        this.ant = new Ant(getLevel(1).start, getLevel(1).heading);
        this.grid = new Grid(getLevel(1));
        this.sequence = new Sequence();
        this.audio = new Audio();
        this.sprite = new AntSprite(this.elements.gridContainer);
        this.runner = new Runner(this);
    }

    loadLevel(levelNum) {
        this.mode = 'campaign';
        this.currentLevel = levelNum;
        document.body.classList.remove('sandbox-mode');
        this.elements.levelNum.textContent = levelNum;
        this.applyLevelData(getLevel(levelNum));
    }

    enterSandbox() {
        this.mode = 'sandbox';
        document.body.classList.add('sandbox-mode');
        this.elements.levelNum.textContent = '🛠';
        this.applyLevelData(this.sandbox.toLevelData());
    }

    /** Load a campaign level object into the sandbox editor for tweaking. */
    openLevelInSandbox(level) {
        this.sandbox.loadFrom(level);
        this.enterSandbox();
    }

    applyLevelData(levelData) {
        this.sequence.clear();
        this.updateTabs();
        this.renderSequence();
        this.refreshBoard(levelData);
    }

    refreshBoard(levelData) {
        this.levelData = levelData;
        this.ant.setStart(levelData.start, levelData.heading);
        this.grid.configure(levelData);
        this.patrol = levelData.patrol ? new Patrol(levelData.patrol) : null;
        document.body.classList.toggle('has-leaves',
            levelData.leaves.length > 0 || this.mode === 'sandbox');
        this.hud.updateLeafTracker(this.grid);
        this.renderGrid();
        if (this.mode === 'sandbox') {
            this.markPatrolPath();
            this.updateDirButton(levelData.heading);
        }
        requestAnimationFrame(() => requestAnimationFrame(() => this.syncSprite()));
    }

    /** Reflect the ant's start facing on the editor's direction button. */
    updateDirButton(heading) {
        const arrows = { up: '⬆️', right: '➡️', down: '⬇️', left: '⬅️' };
        if (this.elements.dirBtn) this.elements.dirBtn.textContent = arrows[heading] || arrows.up;
    }

    /** In the editor, badge each spider-path cell with its walk order. */
    markPatrolPath() {
        const patrol = this.levelData.patrol;
        if (!patrol) return;
        patrol.path.forEach((key, i) => {
            const [x, y] = key.split(',').map(Number);
            const cell = this.elements.gridContainer.querySelector(`[data-x="${x}"][data-y="${y}"]`);
            if (!cell) return;
            cell.classList.add('patrol-path');
            const badge = document.createElement('span');
            badge.className = 'patrol-order';
            badge.textContent = i + 1;
            cell.appendChild(badge);
        });
    }

    renderGrid() {
        this.grid.render(this.elements.gridContainer);
        this.sprite.ensureAttached();
    }

    syncSprite() {
        this.sizeGrid();
        this.moveSpriteToAnt(false);
        this.sprite.setRotation(this.ant.rotationDeg, false);
        this.movePatrolOverlay(false);
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

    /** Lunge the ant halfway into a blocked cell (wall/rock) before it dies. */
    bumpAntForward(target) {
        const cur = this.ant.position;
        const from = this.grid.getCellPosition(this.elements.gridContainer, cur.x, cur.y);
        if (!from) return;
        const dest = this.grid.getCellPosition(this.elements.gridContainer, target.x, target.y);
        let left, top;
        if (dest) {
            left = (from.left + dest.left) / 2;
            top = (from.top + dest.top) / 2;
        } else {
            const pitch = from.width + 3; // cell size + grid gap
            left = from.left + Math.sign(target.x - cur.x) * pitch / 2;
            top = from.top + Math.sign(target.y - cur.y) * pitch / 2;
        }
        this.sprite.nudge({ left, top }, 200);
    }

    movePatrolOverlay(animate = true) {
        if (!this.patrol) {
            if (this.patrolEl) { this.patrolEl.remove(); this.patrolEl = null; }
            return;
        }
        if (!this.patrolEl || !this.patrolEl.isConnected) {
            this.patrolEl = document.createElement('div');
            this.patrolEl.className = 'patrol-overlay';
            this.patrolEl.textContent = '🕷️';
            this.elements.gridContainer.appendChild(this.patrolEl);
        }
        const { x, y } = this.patrol.position();
        const pos = this.grid.getCellPosition(this.elements.gridContainer, x, y);
        if (!pos) return;
        const el = this.patrolEl;
        if (!animate) el.style.transition = 'none';
        el.style.left = `${pos.left}px`;
        el.style.top = `${pos.top}px`;
        el.style.fontSize = `${pos.width * 0.55}px`;
        if (!animate) { el.offsetHeight; el.style.transition = ''; }
    }

    renderSequence() {
        renderSequence(this.elements.sequenceArea, this.elements.sequencePlaceholder,
            this.sequence, {
                onCountChange: (i, d) => this.editSequence(() => this.sequence.changeCount(i, d), 'click'),
                onRemove: (i) => this.editSequence(() => this.sequence.removeAt(i), 'clear')
            });
    }

    /** Switch which list (main program or function) is being edited */
    setActiveList(list) {
        if (this.isPlaying) return;
        this.sequence.setActiveList(list);
        this.updateTabs();
        this.renderSequence();
        this.audio.play('click');
    }

    updateTabs() {
        const list = this.sequence.activeList;
        document.querySelectorAll('.seq-tab').forEach(tab =>
            tab.classList.toggle('active', tab.dataset.list === list));
        document.body.classList.toggle('editing-function', list === 'function');
    }

    editSequence(fn, sound) {
        if (this.isPlaying) return;
        if (fn()) {
            this.renderSequence();
            if (sound) this.audio.play(sound);
        }
    }

    highlightBlock(index) {
        this.elements.sequenceArea.querySelectorAll(':scope > .cmd-block')
            .forEach(el => el.classList.toggle('executing', Number(el.dataset.index) === index));
        const active = this.elements.sequenceArea.querySelector('.executing');
        if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }

    addCommand(action) {
        if (this.isPlaying) return;
        if (action === 'call') {
            if (this.sequence.activeList !== 'main') return;
            this.sequence.addCall();
        } else {
            this.sequence.add(action);
        }
        this.renderSequence();
        this.audio.play('click');
    }

    async play() {
        if (this.isPlaying || this.sequence.totalSteps() === 0) return;
        this.sequence.setActiveList('main');
        this.updateTabs();
        this.renderSequence();
        this.isPlaying = true;
        this.elements.playBtn.disabled = true;
        this.sprite.stopIdleLoop();
        this.restoreLevelState();

        const { result } = await this.runner.run();

        if (result === 'success') {
            await this.runner.delay(300);
            let stars = 0;
            if (this.mode === 'campaign') {
                stars = starsFor(this.currentLevel, this.sequence.countBlocks());
                this.progress.setStars(this.currentLevel, stars);
            }
            this.hud.fillSuccess(stars, this.grid);
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
        this.sprite.startIdleLoop();
    }

    restoreLevelState() {
        this.ant.reset();
        this.grid.reset(this.levelData);
        if (this.patrol) this.patrol.reset();
        this.sprite.setCarrying(false);
        this.hud.updateLeafTracker(this.grid);
        this.renderGrid();
        this.moveSpriteToAnt(false);
        this.sprite.setRotation(this.ant.rotationDeg, false);
        this.movePatrolOverlay(false);
    }

    nextLevel() {
        if (this.mode === 'campaign' && this.currentLevel < getTotalLevels()) {
            this.loadLevel(this.currentLevel + 1);
        }
        this.elements.successOverlay.classList.remove('active');
    }

    openMap() {
        this.elements.successOverlay.classList.remove('active');
        this.map.open(this.progress, getTotalLevels(),
            this.mode === 'campaign' ? this.currentLevel : 0);
    }

    showFeedback(emoji) {
        this.hud.showFeedback(emoji);
    }
}
