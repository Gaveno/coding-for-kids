/**
 * EditorModals - Load and save popup modals for the level editor.
 * The load modal picks a level to edit; the save modal picks where to write.
 */
import { previewCard } from './LevelPreview.js';

function makeOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay editor-overlay';
    const content = document.createElement('div');
    content.className = 'overlay-content editor-modal';
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));
    const close = () => overlay.remove();
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    return { content, close };
}

function heading(emoji) {
    const el = document.createElement('div');
    el.className = 'editor-modal-title';
    el.textContent = emoji;
    return el;
}

function actionBtn(emoji, label) {
    const btn = document.createElement('button');
    btn.className = 'editor-action-btn';
    btn.setAttribute('aria-label', label);
    btn.textContent = emoji;
    return btn;
}

/** Show a grid of level previews; calls onPick(index) when one is chosen. */
export function openLoadModal(levels, onPick) {
    const { content, close } = makeOverlay();
    content.appendChild(heading('📂'));
    const grid = document.createElement('div');
    grid.className = 'level-card-grid';
    levels.forEach((lv, i) => {
        const card = previewCard(lv, i);
        card.addEventListener('click', () => { close(); onPick(i); });
        grid.appendChild(card);
    });
    content.appendChild(grid);
}

/**
 * Show the save modal. Step 1 picks a target level (or "add to end"); step 2
 * picks replace / insert-before / insert-after. Calls onChoose({ mode, index }).
 */
export function openSaveModal(levels, onChoose) {
    const { content, close } = makeOverlay();

    const showList = () => {
        content.innerHTML = '';
        content.appendChild(heading('💾'));
        const grid = document.createElement('div');
        grid.className = 'level-card-grid';
        levels.forEach((lv, i) => {
            const card = previewCard(lv, i);
            card.addEventListener('click', () => showActions(i));
            grid.appendChild(card);
        });
        content.appendChild(grid);
        const append = actionBtn('➕', 'Add to end');
        append.classList.add('editor-append-btn');
        append.addEventListener('click', () => { close(); onChoose({ mode: 'append' }); });
        content.appendChild(append);
    };

    const showActions = (index) => {
        content.innerHTML = '';
        content.appendChild(heading('💾'));
        content.appendChild(previewCard(levels[index], index));
        const choose = (mode) => { close(); onChoose({ mode, index }); };
        const before = actionBtn('⬅️', 'Insert before');
        before.addEventListener('click', () => choose('before'));
        const over = actionBtn('🔁', 'Replace this level');
        over.addEventListener('click', () => choose('override'));
        const after = actionBtn('➡️', 'Insert after');
        after.addEventListener('click', () => choose('after'));
        const row = document.createElement('div');
        row.className = 'editor-action-row';
        row.append(before, over, after);
        const back = actionBtn('🔙', 'Back');
        back.addEventListener('click', showList);
        content.append(row, back);
    };

    showList();
}
