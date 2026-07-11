/**
 * Controls - Wires up all buttons, taps, keyboard, and resize events
 */
export function bindControls(game) {
    const els = game.elements;

    document.querySelectorAll('.command-btn').forEach(btn =>
        btn.addEventListener('click', () => game.addCommand(btn.dataset.command)));

    // Sequence list tabs (main program / function)
    document.querySelectorAll('.seq-tab').forEach(tab =>
        tab.addEventListener('click', () => game.setActiveList(tab.dataset.list)));

    // Sandbox editor tools
    document.querySelectorAll('.tool-btn').forEach(btn =>
        btn.addEventListener('click', () => {
            game.sandbox.setTool(btn.dataset.tool);
            document.querySelectorAll('.tool-btn').forEach(b =>
                b.classList.toggle('active', b === btn));
        }));
    els.gridContainer.addEventListener('click', (e) => {
        const cell = e.target.closest('.grid-cell');
        if (!cell || game.mode !== 'sandbox' || game.isPlaying) return;
        if (game.sandbox.edit(Number(cell.dataset.x), Number(cell.dataset.y))) {
            game.audio.play('click');
            game.refreshBoard(game.sandbox.toLevelData());
        }
    });

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
