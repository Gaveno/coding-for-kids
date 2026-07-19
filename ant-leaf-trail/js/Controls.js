/**
 * Controls - Wires up all buttons, taps, keyboard, and resize events
 */
import { validateLevel } from './Levels.js';
import { openLoadModal, openSaveModal } from './EditorModals.js';
import { loadLevels, saveLevel as saveLevelToFile, canWriteFiles } from './LevelIO.js';

export function bindControls(game) {
    const els = game.elements;

    document.querySelectorAll('.command-btn').forEach(btn =>
        btn.addEventListener('click', () => game.addCommand(btn.dataset.command)));

    // Sequence list tabs (main program / function)
    document.querySelectorAll('.seq-tab').forEach(tab =>
        tab.addEventListener('click', () => game.setActiveList(tab.dataset.list)));

    // Sandbox editor tools (only buttons that select a placement tool)
    const toolButtons = document.querySelectorAll('.tool-btn[data-tool]');
    toolButtons.forEach(btn =>
        btn.addEventListener('click', () => {
            game.sandbox.setTool(btn.dataset.tool);
            toolButtons.forEach(b => b.classList.toggle('active', b === btn));
        }));

    // Ant start direction - rotate the facing without re-tapping the ant tool
    els.dirBtn.addEventListener('click', () => {
        game.sandbox.rotateStart();
        game.audio.play('rotate');
        game.refreshBoard(game.sandbox.toLevelData());
    });
    els.gridContainer.addEventListener('click', (e) => {
        const cell = e.target.closest('.grid-cell');
        if (!cell || game.mode !== 'sandbox' || game.isPlaying) return;
        if (game.sandbox.edit(Number(cell.dataset.x), Number(cell.dataset.y))) {
            game.audio.play('click');
            game.refreshBoard(game.sandbox.toLevelData());
        }
    });

    // Level export tool - only useful when running locally during development
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        if (isRunningLocally()) document.body.classList.add('local-mode');
        exportBtn.addEventListener('click', () => exportLevel(game));
    }

    // Level open tool - load a campaign level into the editor to iterate on it
    const openBtn = document.getElementById('openBtn');
    if (openBtn) openBtn.addEventListener('click', () => openLevel(game));

    // Level save tool - write the current layout straight into Levels.js
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.addEventListener('click', () => runSaveFlow(game));

    els.playBtn.addEventListener('click', () => game.play());
    els.resetBtn.addEventListener('click', () => {
        if (!game.isPlaying) { game.restoreLevelState(); game.highlightBlock(-1); }
    });
    els.clearBtn.addEventListener('click', () =>
        game.editSequence(() => game.sequence.clearActive(), 'clear'));

    // Overlays
    els.helpBtn.addEventListener('click', () => els.helpOverlay.classList.add('active'));
    els.closeHelpBtn.addEventListener('click', () => els.helpOverlay.classList.remove('active'));
    els.helpOverlay.addEventListener('click', (e) => {
        if (e.target === els.helpOverlay) els.helpOverlay.classList.remove('active');
    });
    els.nextBtn.addEventListener('click', () => game.nextLevel());
    els.mapBtn.addEventListener('click', () => game.openMap());
    els.successMapBtn.addEventListener('click', () => game.openMap());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (game.isPlaying) return;
        const keyMap = { ArrowUp: 'forward', ArrowRight: 'right', ArrowLeft: 'left' };
        if (keyMap[e.key]) game.addCommand(keyMap[e.key]);
        else if (e.key === 'Enter') game.play();
    });

    // Keep sprite/patrol aligned on resize and rotation
    const resync = () => { if (!game.isPlaying) requestAnimationFrame(() => game.syncSprite()); };
    window.addEventListener('resize', resync);
    window.addEventListener('orientationchange', () => setTimeout(resync, 100));
    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(resync).observe(game.elements.gridSection);
    }
}

/** True when served from a local dev environment (localhost or file://). */
function isRunningLocally() {
    const host = location.hostname;
    return location.protocol === 'file:' ||
        host === 'localhost' || host === '127.0.0.1' || host === '' || host === '::1';
}

/** Copy the sandbox layout as a LEVELS-constant entry for pasting into Levels.js. */
function exportLevel(game) {
    const text = game.sandbox.toLevelString();
    console.log(text);
    game.audio.play('click');
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .catch(() => window.prompt('Copy this level:', text));
    } else {
        window.prompt('Copy this level:', text);
    }
}

/** Show the load modal with level previews and open the chosen one. */
async function openLevel(game) {
    try {
        const { levels } = await loadLevels();
        openLoadModal(levels, (i) => {
            game.openLevelInSandbox(levels[i]);
            game.audio.play('click');
        });
    } catch (err) {
        window.alert('Could not load levels: ' + (err?.message || err));
    }
}

/** Validate the layout, then show the save modal to write it into Levels.js. */
async function runSaveFlow(game) {
    const layout = game.sandbox.toLevelData();
    const errors = validateLevel(layout);
    if (errors && errors.length) {
        game.audio.play('error');
        window.alert('Level not ready:\n' + errors.join('\n'));
        return;
    }
    if (!canWriteFiles()) {
        exportLevel(game);
        window.alert('Direct save needs Chrome/Edge on http://localhost.\nLevel copied to clipboard instead.');
        return;
    }
    const { levels } = await loadLevels();
    openSaveModal(levels, async (choice) => {
        try {
            const num = await saveLevelToFile(layout, choice.mode, choice.index ?? 0);
            game.audio.play('deliver');
            game.showFeedback('💾' + num);
        } catch (err) {
            if (err?.name === 'AbortError') return;
            game.audio.play('error');
            window.alert('Could not save: ' + (err?.message || err));
        }
    });
}

