/**
 * Blocks - Builds DOM for command blocks in the sequence area.
 * Every block carries its own count with +/- controls directly on it.
 * The "call" block runs the reusable function.
 */
const EMOJI_ICONS = { forward: '⬆️', right: '↩️', left: '↪️', call: '💾' };

/** Icon element for an action (emoji for moves, leaf art for pickup/drop) */
export function makeIcon(action) {
    const icon = document.createElement('span');
    icon.className = 'block-icon';
    icon.setAttribute('aria-hidden', 'true');

    if (action === 'pickup' || action === 'drop') {
        const leaf = document.createElement('span');
        leaf.className = 'block-leaf';
        leaf.textContent = '🥬';
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

function makeButton(className, label, text, onClick) {
    const btn = document.createElement('button');
    btn.className = className;
    btn.setAttribute('aria-label', label);
    btn.textContent = text;
    btn.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
    return btn;
}

function makeCounter(cmd, onChange) {
    const counter = document.createElement('div');
    counter.className = 'block-counter';
    counter.appendChild(makeButton('count-btn', 'Fewer', '−', () => onChange(-1)));
    const num = document.createElement('span');
    num.className = 'block-count';
    num.textContent = cmd.count;
    counter.appendChild(num);
    counter.appendChild(makeButton('count-btn', 'More', '+', () => onChange(1)));
    return counter;
}

/** Create a command block (movement, leaf action, or function call) */
export function createCommandBlock(cmd, index, handlers) {
    const block = document.createElement('div');
    block.className = `cmd-block cmd-${cmd.action}`;
    block.appendChild(makeButton('block-remove', 'Remove block', '✕',
        () => handlers.onRemove(index)));
    block.appendChild(makeIcon(cmd.action));
    // Leaf pickup/drop can't repeat (only one leaf can be carried)
    if (cmd.action !== 'pickup' && cmd.action !== 'drop') {
        block.appendChild(makeCounter(cmd, (d) => handlers.onCountChange(index, d)));
    }
    return block;
}

/** Render the active command list into the sequence area */
export function renderSequence(area, placeholder, sequence, handlers) {
    area.querySelectorAll('.cmd-block').forEach(el => el.remove());
    placeholder.style.display = sequence.isEmpty() ? 'flex' : 'none';
    sequence.active().forEach((cmd, index) => {
        const el = createCommandBlock(cmd, index, handlers);
        el.dataset.index = index;
        area.appendChild(el);
    });
}
