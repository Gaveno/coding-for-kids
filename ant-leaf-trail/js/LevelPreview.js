/**
 * LevelPreview - Builds tiny emoji-grid previews of a level, used by the
 * editor's load and save modals so authors can recognise levels at a glance.
 */
const TESTS = [
    (lv, key) => `${lv.start.x},${lv.start.y}` === key && '🐜',
    (lv, key) => lv.nest === key && '🕳️',
    (lv, key) => (lv.obstacles || []).includes(key) && '🪨',
    (lv, key) => (lv.tunnels || []).includes(key) && '🌀',
    (lv, key) => (lv.leaves || []).includes(key) && '🥬',
    (lv, key) => (lv.crumbs || []).includes(key) && '🍪',
    (lv, key) => lv.patrol && lv.patrol.path.includes(key) && '🕷️'
];

function cellEmoji(level, key) {
    for (const test of TESTS) {
        const emoji = test(level, key);
        if (emoji) return emoji;
    }
    return '';
}

export function buildPreview(level) {
    const grid = document.createElement('div');
    grid.className = 'level-preview';
    grid.style.gridTemplateColumns = `repeat(${level.gridSize}, 1fr)`;
    for (let y = 0; y < level.gridSize; y++) {
        for (let x = 0; x < level.gridSize; x++) {
            const cell = document.createElement('span');
            cell.className = 'preview-cell';
            cell.textContent = cellEmoji(level, `${x},${y}`);
            grid.appendChild(cell);
        }
    }
    return grid;
}

export function previewCard(level, index) {
    const card = document.createElement('button');
    card.className = 'level-card';
    card.setAttribute('aria-label', `Level ${index + 1}`);
    card.appendChild(buildPreview(level));
    const num = document.createElement('span');
    num.className = 'level-card-num';
    num.textContent = index + 1;
    card.appendChild(num);
    return card;
}
