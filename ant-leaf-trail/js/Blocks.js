/**
 * Blocks - Builds DOM for command blocks in the sequence area.
 * Every block carries its own count with +/- controls directly on it.
 */
const EMOJI_ICONS = { forward: '⬆️', right: '↩️', left: '↪️' };

/** Icon element for an action (emoji for moves, leaf art for pickup/drop) */
export function makeIcon(action) {
    const icon = document.createElement('span');
    icon.className = 'block-icon';
    icon.setAttribute('aria-hidden', 'true');

    if (action === 'pickup' || action === 'drop') {
        const leaf = document.createElement('img');
        leaf.className = 'block-leaf';
        leaf.src = '../art/leaf.png';
        leaf.alt = '';
        leaf.draggable = false;
        icon.appendChild(leaf);
        const badge = document.createElement('span');
        badge.className = 'leaf-badge ' + (action === 'pickup' ? 'badge-up' : 'badge-down');
        badge.textContent = action === 'pickup' ? '⬆' : '⬇';
        icon.appendChild(badge);
    } else {
        icon.textContent = EMOJI_ICONS[action] || '❓';
    }
    return icon;
}

/**
 * Create a sequence block element
 * @param {object} cmd - { action, count }
 * @param {number} index - Position in the sequence
 * @param {object} handlers - { onCountChange(index, delta), onRemove(index) }
 */
export function createCommandBlock(cmd, index, handlers) {
    const block = document.createElement('div');
    block.className = `cmd-block cmd-${cmd.action}`;
    block.dataset.index = index;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'block-remove';
    removeBtn.setAttribute('aria-label', 'Remove block');
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handlers.onRemove(index);
    });
    block.appendChild(removeBtn);

    block.appendChild(makeIcon(cmd.action));

    const counter = document.createElement('div');
    counter.className = 'block-counter';

    const minus = document.createElement('button');
    minus.className = 'count-btn';
    minus.setAttribute('aria-label', 'Fewer');
    minus.textContent = '−';
    minus.addEventListener('click', (e) => {
        e.stopPropagation();
        handlers.onCountChange(index, -1);
    });

    const num = document.createElement('span');
    num.className = 'block-count';
    num.textContent = cmd.count;

    const plus = document.createElement('button');
    plus.className = 'count-btn';
    plus.setAttribute('aria-label', 'More');
    plus.textContent = '+';
    plus.addEventListener('click', (e) => {
        e.stopPropagation();
        handlers.onCountChange(index, 1);
    });

    counter.appendChild(minus);
    counter.appendChild(num);
    counter.appendChild(plus);
    block.appendChild(counter);

    return block;
}
