/**
 * Blocks - Builds DOM for command blocks and loop blocks in the sequence area.
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

/**
 * Create a command block. childIndex is non-null for blocks inside a loop
 * (then index refers to the loop's top-level position).
 */
export function createCommandBlock(cmd, index, handlers, childIndex = null) {
    const block = document.createElement('div');
    block.className = `cmd-block cmd-${cmd.action}` + (childIndex !== null ? ' loop-child' : '');
    block.appendChild(makeButton('block-remove', 'Remove block', '✕',
        () => handlers.onRemove(index, childIndex)));
    block.appendChild(makeIcon(cmd.action));
    block.appendChild(makeCounter(cmd, (d) => handlers.onCountChange(index, d, childIndex)));
    return block;
}

/** Create a loop container block with iteration counter and child blocks */
export function createLoopBlock(cmd, index, handlers, isActive) {
    const block = document.createElement('div');
    block.className = 'loop-block' + (isActive ? ' active' : '');

    const header = document.createElement('div');
    header.className = 'loop-header';
    const icon = document.createElement('span');
    icon.className = 'loop-icon';
    icon.textContent = '🔁';
    header.appendChild(icon);
    header.appendChild(makeCounter(cmd, (d) => handlers.onCountChange(index, d, null)));
    header.appendChild(makeButton('block-remove', 'Remove loop', '✕',
        () => handlers.onRemove(index, null)));
    block.appendChild(header);

    const body = document.createElement('div');
    body.className = 'loop-body';
    if (cmd.children.length === 0) {
        const hint = document.createElement('div');
        hint.className = 'loop-placeholder';
        hint.textContent = '👆';
        body.appendChild(hint);
    } else {
        cmd.children.forEach((child, ci) => {
            body.appendChild(createCommandBlock(child, index, handlers, ci));
        });
    }
    block.appendChild(body);

    block.addEventListener('click', (e) => {
        if (!e.target.closest('button') && !e.target.closest('.cmd-block')) {
            handlers.onToggleLoop(index);
        }
    });
    return block;
}

/** Render the full sequence into the sequence area */
export function renderSequence(area, placeholder, sequence, handlers) {
    area.querySelectorAll('.cmd-block, .loop-block').forEach(el => el.remove());
    placeholder.style.display = sequence.isEmpty() ? 'flex' : 'none';
    sequence.commands.forEach((cmd, index) => {
        const el = cmd.action === 'loop'
            ? createLoopBlock(cmd, index, handlers, sequence.activeLoop === index)
            : createCommandBlock(cmd, index, handlers);
        el.dataset.index = index;
        area.appendChild(el);
    });
}
